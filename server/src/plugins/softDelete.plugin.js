import mongoose from "mongoose";

/**
 * Reusable Mongoose Soft Delete Plugin
 *
 * Adds:
 *  - `isDeleted`: Boolean flag (indexed, default false)
 *  - `deletedAt`: Timestamp of soft deletion
 *  - `deletedBy`: Reference or metadata identifier of user/admin who triggered deletion
 *
 * Automatically filters out soft-deleted records from standard queries:
 *  - `find`, `findOne`, `findOneAndUpdate`, `updateOne`, `updateMany`, `countDocuments`, `distinct`
 *  - `aggregate` pipelines
 *
 * Provides document and model methods:
 *  - `doc.softDelete(deletedBy)`
 *  - `doc.restore()`
 *  - `Model.softDelete(filter, deletedBy)`
 *  - `Model.softDeleteById(id, deletedBy)`
 *  - `Model.restore(filter)`
 *  - `Model.restoreById(id)`
 *  - `Model.findDeleted(filter)`
 *  - `Model.findWithDeleted(filter)`
 */
export function softDeletePlugin(schema) {
  // 1. Add Soft Delete Fields
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  });

  // Query helper to include soft-deleted records explicitly: query.includeDeleted()
  schema.query.includeDeleted = function () {
    return this.setOptions({ includeDeleted: true });
  };

  // Query helper to fetch only soft-deleted records: query.onlyDeleted()
  schema.query.onlyDeleted = function () {
    return this.where({ isDeleted: true });
  };

  // 2. Query Middleware: Filter out deleted documents by default
  const excludeDeletedMiddleware = function () {
    const options = this.getOptions() || {};
    if (options.includeDeleted) {
      return;
    }

    const filter = this.getFilter() || {};
    // If the query explicitly filters on isDeleted (true or false), do not override
    if (filter.isDeleted !== undefined) {
      return;
    }

    // Exclude records where isDeleted === true.
    // { $ne: true } gracefully matches documents with isDeleted: false, null, or undefined.
    this.where({ isDeleted: { $ne: true } });
  };

  schema.pre("find", excludeDeletedMiddleware);
  schema.pre("findOne", excludeDeletedMiddleware);
  schema.pre("findOneAndUpdate", excludeDeletedMiddleware);
  schema.pre("updateOne", excludeDeletedMiddleware);
  schema.pre("updateMany", excludeDeletedMiddleware);
  schema.pre("countDocuments", excludeDeletedMiddleware);
  schema.pre("distinct", excludeDeletedMiddleware);

  // 3. Aggregate Middleware: Inject match stage into aggregation pipeline
  schema.pre("aggregate", function () {
    const options = this.options || {};
    if (options.includeDeleted) {
      return;
    }

    const pipeline = this.pipeline();
    const hasDeletedFilter = pipeline.some(
      (stage) => stage.$match && stage.$match.isDeleted !== undefined
    );

    if (!hasDeletedFilter) {
      // If the first stage is $geoNear or $indexStats, match must follow it
      if (pipeline.length > 0 && (pipeline[0].$geoNear || pipeline[0].$indexStats)) {
        pipeline.splice(1, 0, { $match: { isDeleted: { $ne: true } } });
      } else {
        pipeline.unshift({ $match: { isDeleted: { $ne: true } } });
      }
    }
  });

  // 4. Instance Methods
  schema.methods.softDelete = async function (deletedBy = null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    if (deletedBy) {
      this.deletedBy = deletedBy;
    }
    return this.save();
  };

  schema.methods.restore = async function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };

  // 5. Model Static Methods
  schema.statics.softDelete = function (filter = {}, deletedBy = null) {
    return this.updateMany(
      filter,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          ...(deletedBy ? { deletedBy } : {}),
        },
      },
      { includeDeleted: true }
    );
  };

  schema.statics.softDeleteById = async function (id, deletedBy = null) {
    const doc = await this.findOne({ _id: id });
    if (!doc) return null;
    return doc.softDelete(deletedBy);
  };

  schema.statics.restore = function (filter = {}) {
    return this.updateMany(
      { ...filter, isDeleted: true },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { includeDeleted: true }
    );
  };

  schema.statics.restoreById = async function (id) {
    const doc = await this.findOne({ _id: id, isDeleted: true });
    if (!doc) return null;
    return doc.restore();
  };

  schema.statics.findDeleted = function (filter = {}, projection, options = {}) {
    return this.find({ ...filter, isDeleted: true }, projection, options);
  };

  schema.statics.findWithDeleted = function (filter = {}, projection, options = {}) {
    return this.find(filter, projection, { ...options, includeDeleted: true });
  };

  schema.statics.findOneDeleted = function (filter = {}, projection, options = {}) {
    return this.findOne({ ...filter, isDeleted: true }, projection, options);
  };

  schema.statics.findOneWithDeleted = function (filter = {}, projection, options = {}) {
    return this.findOne(filter, projection, { ...options, includeDeleted: true });
  };
}

export default softDeletePlugin;
