import redis from "../utils/redis.js";
import { Logger } from "../utils/logger.js";
import { skipSegmentsHashKey, skipSegmentsKey, reputationKey } from "./redisKeys.js";
import { Service, VideoID, VideoIDHash } from "../types/segments.model.js";
import { UserID } from "../types/user.model.js";

async function get<T>(fetchFromDB: () => Promise<T>, key: string): Promise<T> {
    const { err, reply } = await redis.getAsync(key);

    if (!err && reply) {
        try {
            Logger.debug(`Got data from redis: ${reply}`);
            return JSON.parse(reply);
        } catch (e) {
            // If all else, continue on to fetching from the database
        }
    }

    const data = await fetchFromDB();

    redis.setAsync(key, JSON.stringify(data));
    return data;
}

function clearVideoCache(videoInfo: { videoID: VideoID; hashedVideoID: VideoIDHash; service: Service; userID?: UserID; }): void {
    if (videoInfo) {
        redis.delAsync(skipSegmentsKey(videoInfo.videoID, videoInfo.service));
        redis.delAsync(skipSegmentsHashKey(videoInfo.hashedVideoID, videoInfo.service));
        if (videoInfo.userID) redis.delAsync(reputationKey(videoInfo.userID));
    }
}

export const QueryCacher = {
    get,
    clearVideoCache
};