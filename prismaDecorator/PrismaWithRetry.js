class PrismaWithRetry {
    constructor(prismaClient, maxRetries = 3, delay = 1000) {
        this.prisma = prismaClient;
        this.maxRetries = maxRetries;
        this.delay = delay;
    }

    async executeWithRetry(func) {
        let lastError;
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                return await func();
            } catch (e) {
                lastError = e;
                await new Promise((res) => setTimeout(res, this.delay));
            }
        }

        throw lastError;
    }

    async findFirst(modelName, options) {
        return this.executeWithRetry(() =>
            this.prisma[modelName].findFirst(options)
        );
    }

    async findMany(modelName, options) {
        return this.executeWithRetry(() =>
            this.prisma[modelName].findMany(options)
        );
    }

    async findUnique(modelName, options) {
        return this.executeWithRetry(() =>
            this.prisma[modelName].findUnique(options)
        );
    }

    async create(modelName, data) {
        return this.executeWithRetry(() => this.prisma[modelName].create(data));
    }

    async update(modelName, options) {
        return this.executeWithRetry(() =>
            this.prisma[modelName].update(options)
        );
    }

    async delete(modelName, options) {
        return this.executeWithRetry(() =>
            this.prisma[modelName].delete(options)
        );
    }

    async deleteMany(modelName, options) {
        return this.executeWithRetry(() =>
            this.prisma[modelName].deleteMany(options)
        );
    }

    async disconnect() {
        await this.prisma.$disconnect();
    }
}

export default PrismaWithRetry;
