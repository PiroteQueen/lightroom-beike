if (typeof queueMicrotask !== 'function') {
    globalThis.queueMicrotask = function (callback) {
        Promise.resolve()
            .then(callback)
            .catch(e => setTimeout(() => { throw e; }));
    };
} 