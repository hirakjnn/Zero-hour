class Whiteboard {
    constructor() {
        this.objects = {}; // Store whiteboard objects: { id: { ...properties } }
        this.locks = {};   // Store locks: { objectId: userId }
    }

    createObject(objectId, properties) {
        if (this.objects[objectId]) {
            throw new Error("Object already exists");
        }
        this.objects[objectId] = properties;
    }

    // TODO: Implement acquireLock
    acquireLock(userId, objectId) {
        // Return true if acquired or already held by user, false otherwise
        return false;
    }

    // TODO: Implement releaseLock
    releaseLock(userId, objectId) {
        // Return true if released successfully, false otherwise
        return false;
    }

    // TODO: Modify updateObject to require a lock
    updateObject(userId, objectId, newProperties) {
        if (!this.objects[objectId]) {
            throw new Error("Object not found");
        }
        
        // Ensure user holds the lock before updating!
        
        this.objects[objectId] = {
            ...this.objects[objectId],
            ...newProperties
        };
    }
}

// Basic tests
const wb = new Whiteboard();
wb.createObject("obj1", { type: "rect", x: 10, y: 10 });

console.log("Acquiring lock for user1:", wb.acquireLock("user1", "obj1")); // Expected: true
console.log("Acquiring lock for user2:", wb.acquireLock("user2", "obj1")); // Expected: false

try {
    wb.updateObject("user2", "obj1", { x: 20 });
    console.error("FAIL: user2 was able to update without lock!");
} catch (e) {
    console.log("PASS: user2 prevented from updating.");
}

wb.updateObject("user1", "obj1", { x: 20 });
console.log("Object after user1 update:", wb.objects["obj1"]);

console.log("Releasing lock for user1:", wb.releaseLock("user1", "obj1")); // Expected: true

module.exports = Whiteboard;
