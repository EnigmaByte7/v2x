import { Injectable, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, Reflector } from "@nestjs/core";
import { IngestionService } from "../ingestion.service";
import { MqttControllerKey } from "../constants";

@Injectable()
export class MqttExplorer implements OnModuleInit {
    constructor(
        private readonly discoveryService: DiscoveryService, 
        private readonly reflector: Reflector,
        private readonly ingestionService: IngestionService
    ) {}

    onModuleInit() {
        const providers = this.discoveryService.getProviders();        
        for (const wrapper of providers) {
            const { instance, metatype } = wrapper;

            if (!instance || !metatype || wrapper.name === 'DataSource' || wrapper.name === 'EntityManager') {
                continue;
            }

            const proto = Object.getPrototypeOf(instance);
            const propertyNames = Object.getOwnPropertyNames(proto);

            for (const propertyName of propertyNames) {
                const descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
                if (!descriptor || typeof descriptor.value !== 'function' || propertyName === 'constructor') {
                    continue;
                }

                const method = instance[propertyName];
                const topic = this.reflector.get(MqttControllerKey, method);

                if (topic && topic.topic) {
                    this.ingestionService.subscribe(topic.topic, method.bind(instance));
                }
            }
        }
    }
}