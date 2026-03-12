import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voidgraph';
const client = new MongoClient(uri);

let db: Db;
let nodesCollection: Collection;
let digestsCollection: Collection;

export async function connectDB() {
  try {
    await client.connect();
    db = client.db();
    nodesCollection = db.collection('nodes');
    digestsCollection = db.collection('digests');
    console.log('[DB] Connected to MongoDB - The Abyssal Archive is online.');
  } catch (error) {
    console.error('[DB] Failed to connect to MongoDB:', error);
    // Fallback or exit
  }
}

export function getDb() {
  return db;
}

export function getNodesCollection() {
  return nodesCollection;
}

export function getDigestsCollection() {
  return digestsCollection;
}

/**
 * Aggregation pipeline for Target Acquisition:
 * Query the database for the 10 nodes with the lowest `saturation_level` or oldest `last_audited_date`.
 */
export async function getNodesForDensification() {
  if (!nodesCollection) return [];
  
  const pipeline = [
    {
      $match: {
        $or: [
          { saturation_level: { $lt: 100 } },
          { last_audited_date: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Older than 7 days
        ]
      }
    },
    {
      $sort: {
        saturation_level: 1, // Ascending: lowest saturation first
        last_audited_date: 1 // Ascending: oldest audited first
      }
    },
    {
      $limit: 10
    }
  ];

  return await nodesCollection.aggregate(pipeline).toArray();
}

/**
 * Aggregation pipeline for Weekly Revelation Generation:
 * Aggregate all `revision_count` changes and new Entities from the past 7 days.
 */
export async function getWeeklyChanges() {
  if (!nodesCollection) return [];

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const pipeline = [
    {
      $match: {
        last_audited_date: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: null,
        total_revisions: { $sum: "$revision_count" },
        densified_nodes: { $push: { id: "$_id", label: "$label", type: "$type", summary: "$summary" } }
      }
    }
  ];

  return await nodesCollection.aggregate(pipeline).toArray();
}
