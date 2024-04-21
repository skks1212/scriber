import { GameSession, Player, User } from "@prisma/client";
import prisma from "./prisma";

export class SerializerValidationError extends Error {

    error: Object = {}

    constructor(message: Object) {
        super("Error validating serializer fields: \n" + JSON.stringify(message, null, 2) + "\n");
        this.name = "SerializerValidationError";
        this.error = message
    }

}

interface SerializerField<T> {
    field: keyof T;
    readable?: boolean;
    writeable?: boolean;
    validator?: (value: any) => Promise<true | string[]>;
    serializer?: any;
}

abstract class ModelSerializer<T> {
    protected fields: SerializerField<T>[] = [];

    constructor(fields: SerializerField<T>[]) {
        this.fields = fields.map(field => {
            return {
                ...field,
                readable: field.readable !== undefined ? field.readable : true,
                writeable: field.writeable !== undefined ? field.writeable : true,
            };
        });
    }

    public async validate(material: Partial<T>): Promise<boolean> {
        const fieldNames = this.fields.map(field => field.field);
        let error: any = {}

        for await (const [key, value] of Object.entries(material as Object)) {

            if (!fieldNames.includes(key as keyof T)) {
                error[key] = "Field not allowed"
            }

            const field = this.fields.find(f => f.field === key);
            if (field && field.serializer) {
                const result = await new (field.serializer()).validate(value);
                if (result !== true) {
                    error[key] = result;
                }
            }
            if (field && !field.writeable) {
                error[key] = "Field not writeable"
            }

            if (field && field.validator) {
                const result = await field.validator(value);
                if (result !== true) {
                    error[key] = result;
                }
            }
        }
        if (Object.keys(error).length > 0) {
            throw new SerializerValidationError(error);
        }
        return true;
    }

    public serialize(material: Partial<T>): Partial<T> {
        const serialized: Partial<T> = {};

        for (const field of this.fields) {
            if ((material as Object).hasOwnProperty(field.field) && field.readable) {
                if (field.serializer) {
                    serialized[field.field] = new field.serializer().serialize(material[field.field]);
                } else {
                    serialized[field.field] = material[field.field];
                }
            }
        }

        return serialized;
    }

    public serializeMany(materials: Partial<T>[]): Partial<T>[] {
        return materials.map(material => this.serialize(material));
    }
}

export class UserSerializer extends ModelSerializer<User> {
    constructor() {
        super([
            {
                field: "username", validator: async (value) => {
                    if (!(value.length > 3 && value.length < 20)) {
                        return ["Username must be between 3 and 20 characters"]
                    }
                    return true
                }
            },
            { field: "email", writeable: false },
            { field: "profile_picture_url" },
        ]);
    }
}

export class PLayerSerializer extends ModelSerializer<Player & { user: Partial<User> }> {
    constructor() {
        super([
            {
                field: "score", writeable: false,
            },
            {
                field: "id", writeable: false,
            },
            { field: "user", writeable: false, serializer: UserSerializer }
        ])
    }
}

export class GameSerializer extends ModelSerializer<GameSession & { players?: Partial<Player>[], creator?: Partial<User> }>{
    constructor() {
        super([
            { field: "url", writeable: false },
            { field: "status", writeable: false },
            { field: "createdAt", writeable: false },
            { field: "updatedAt", writeable: false },
            { field: "creator", writeable: false, serializer: UserSerializer },
            { field: "players", writeable: false, serializer: PLayerSerializer }
        ])
    }
}