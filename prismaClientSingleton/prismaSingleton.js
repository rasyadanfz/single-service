import { PrismaClient } from "@prisma/client";

class PrismaSingleton {
    constructor() {
        if (!PrismaSingleton.instance) {
            this.prisma = new PrismaClient();
            PrismaSingleton.instance = this;
        }

        return PrismaSingleton.instance;
    }
}

const prismaSingleton = new PrismaSingleton();
Object.freeze(prismaSingleton);

export default prismaSingleton;
