# Challenge: Converge - Object-level Locking

## Background
You are building a real-time whiteboard application where multiple users can collaborate concurrently. We currently have a rudimentary implementation of a `Whiteboard` class that stores objects by ID.

## Problem
Currently, multiple users can modify the same object at the exact same time, causing race conditions and overwritten changes. We need to implement object-level locking to ensure that when one user is modifying an object, others cannot edit it until the lock is released.

## Your Task
Modify the `whiteboard.js` file to:
1. Implement an `acquireLock(userId, objectId)` method.
   - It should return `true` if the lock was acquired successfully or if the user already holds the lock.
   - It should return `false` if the lock is currently held by someone else.
2. Implement a `releaseLock(userId, objectId)` method.
   - It should release the lock and return `true` if the user held the lock.
   - It should return `false` if the user does not hold the lock.
3. Update `updateObject(userId, objectId, newProperties)` to only allow updates if the user holds the lock. If they don't hold the lock, throw an Error `"Lock not held"`.

## Run the tests
You can test your implementation by running:
`node whiteboard.js`
