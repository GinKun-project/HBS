class RateLimiter {
    constructor() {
        this.requestQueue = [];
        this.isProcessing = false;
        this.minRequestInterval = 100;
        this.lastRequestTime = 0;
        this.maxConcurrentRequests = 5;
        this.activeRequests = 0;
    }

    async throttle(fn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ fn, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        if (this.activeRequests >= this.maxConcurrentRequests) {
            return;
        }

        this.isProcessing = true;

        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minRequestInterval) {
            await this.delay(this.minRequestInterval - timeSinceLastRequest);
        }

        const { fn, resolve, reject } = this.requestQueue.shift();
        this.lastRequestTime = Date.now();
        this.activeRequests++;

        try {
            const result = await fn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.activeRequests--;
            this.isProcessing = false;
            this.processQueue();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setMinInterval(ms) {
        this.minRequestInterval = ms;
    }

    setMaxConcurrent(count) {
        this.maxConcurrentRequests = count;
    }
}

export const rateLimiter = new RateLimiter();

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
