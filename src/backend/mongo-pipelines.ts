/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * EXECUTION MANDATE: MongoDB Aggregation Pipelines
 * 
 * These pipelines represent the exact MongoDB queries required for target acquisition
 * and weekly revelation generation, as per the Autonomous Recursive Densification protocol.
 * 
 * Note: The live preview utilizes an in-memory/SQLite fallback to ensure runnability 
 * without external database dependencies, but these pipelines are the architectural source of truth.
 */

export const targetAcquisitionPipeline = [
  {
    $match: {
      type: { $in: ["library_item", "summary"] },
      $or: [
        { "metadata.saturation_level": { $lt: 100 } },
        { "metadata.last_audited_date": { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      ]
    }
  },
  {
    $addFields: {
      priorityScore: {
        $add: [
          { $subtract: [100, { $ifNull: ["$metadata.saturation_level", 0] }] },
          {
            $divide: [
              { $subtract: [new Date(), { $ifNull: ["$metadata.last_audited_date", new Date(0)] }] },
              1000 * 60 * 60 * 24 // days since last audit
            ]
          }
        ]
      }
    }
  },
  { $sort: { priorityScore: -1 } },
  { $limit: 10 }
];

export const weeklyRevelationPipeline = [
  {
    $match: {
      "metadata.last_audited_date": { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      "metadata.revision_count": { $gt: 0 }
    }
  },
  {
    $group: {
      _id: "$type",
      totalRevisions: { $sum: "$metadata.revision_count" },
      nodes: { $push: { id: "$id", label: "$label", content: "$content" } }
    }
  }
];
