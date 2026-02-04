import { Injectable, OnModuleDestroy, OnModuleInit, PayloadTooLargeException } from '@nestjs/common';
import { MqttClient } from 'mqtt';
import mqtt from 'mqtt';

type MqttHandler = (topic: string, payload: any) => void;

@Injectable()
export class IngestionService implements OnModuleInit, OnModuleDestroy {
    private mqttClient: MqttClient;
    private readonly url = "mqtt:localhost"
    private handlers = new Map<string, MqttHandler>();

    onModuleInit() {
        const options = {
            clean: true,
            connectTimeout: 4000,
            username: 'admin',
            password: 'public',
        }
        const client =  mqtt.connect(this.url, options)
        this.mqttClient = client

        this.mqttClient.on('message', (topic: string, payload: Buffer) => {
            this.dispatch(topic, payload)
        })
    }

    private dispatch(topic: string, payload: any) {
        const handler : MqttHandler | undefined = this.handlers.get(topic)
        if(!handler) {
            return
        }

        try {
            handler(topic, payload);
        }
        catch(e) {
            throw new Error()
        }
    }

    subscribe(topic: string, handler : (topic:string, payload: any) => void) {
        this.mqttClient.subscribe(topic)

        this.handlers.set(topic, handler);
    }

    publish(topic: string, payload: any) {
        this.mqttClient.publish(
        topic,
        JSON.stringify(payload),
        );
    }
    
    async sendAlerts(alerts: any[]) {
        if (!alerts || alerts.length === 0) return;

        for (const alert of alerts) {
            this.mqttClient.publish(
                alert.topic, 
                JSON.stringify({
                ...alert.message,
                timestamp: new Date().toISOString()
                })
            );
            }
    }
    
    onModuleDestroy() {
        this.mqttClient.end()
    }
}