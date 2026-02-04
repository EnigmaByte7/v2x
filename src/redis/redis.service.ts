import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy{
    private redisClient: any

    async onModuleInit() {
        const client = createClient()
        console.log('tryig to connect redis');
        try {
            client.connect()
            client.on('connect', () => console.log('connecte d to redis!'))
            this.redisClient = client
            console.log(client);
            await client.set("hello", 1)
        }
        catch(e){
            console.log(e);
        }
    }

    async trackVehicle(intersectionId: number, stationId: string, data: { isIncoming: boolean, laneId: number, distToIntersection: number }) {
        const setKey = `intersection:${intersectionId}:vehicles`;
        const detailKey = `vehicle:${stationId}`;

        await this.redisClient.sAdd(setKey, stationId);

        await this.redisClient.set(detailKey, JSON.stringify(data));
    }

    async getVehiclesAtIntersection(intersectionId: number): Promise<string[]> {
        return await this.redisClient.sMembers(`intersection:${intersectionId}:vehicles`);
    }

    async getVehicleData(stationId: string) {
        const data = await this.redisClient.get(`vehicle:${stationId}`);
        return data ? JSON.parse(data) : null;
    }

    async setIntersectionActive(intersectionId: number) {
        await this.redisClient.set(`active_emergency:${intersectionId}`, 'true', { EX: 5 });
    }

    async onModuleDestroy() {
        await this.redisClient.destroy()
    }
}
