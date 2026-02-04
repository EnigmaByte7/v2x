import { SetMetadata } from "@nestjs/common"
import { MqttControllerKey } from "../constants"

export function MqttController(topic: string) {
    return SetMetadata(MqttControllerKey, {topic})
}