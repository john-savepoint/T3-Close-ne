/**
 * Unit tests for StreamManager
 */

import { StreamManager } from "../../lib/streaming/manager"

describe("StreamManager", () => {
  let manager: StreamManager

  beforeEach(() => {
    manager = new StreamManager()
  })

  afterEach(() => {
    manager.cancelAllStreams()
  })

  describe("startStream", () => {
    it("should create and track a new stream", () => {
      const controller = manager.startStream("test-stream")

      expect(controller).toBeInstanceOf(AbortController)
      expect(manager.isStreamActive("test-stream")).toBe(true)
    })

    it("should cancel existing stream when starting a new one with same id", () => {
      const controller1 = manager.startStream("test-stream")
      const abortSpy = jest.spyOn(controller1, "abort")

      const controller2 = manager.startStream("test-stream")

      expect(abortSpy).toHaveBeenCalled()
      expect(controller2).not.toBe(controller1)
      expect(manager.isStreamActive("test-stream")).toBe(true)
    })
  })

  describe("cancelStream", () => {
    it("should cancel and remove an active stream", () => {
      const controller = manager.startStream("test-stream")
      const abortSpy = jest.spyOn(controller, "abort")

      const result = manager.cancelStream("test-stream")

      expect(result).toBe(true)
      expect(abortSpy).toHaveBeenCalled()
      expect(manager.isStreamActive("test-stream")).toBe(false)
    })

    it("should return false for non-existent stream", () => {
      const result = manager.cancelStream("non-existent")
      expect(result).toBe(false)
    })
  })

  describe("cancelAllStreams", () => {
    it("should cancel all active streams", () => {
      const controller1 = manager.startStream("stream-1")
      const controller2 = manager.startStream("stream-2")

      const abort1 = jest.spyOn(controller1, "abort")
      const abort2 = jest.spyOn(controller2, "abort")

      manager.cancelAllStreams()

      expect(abort1).toHaveBeenCalled()
      expect(abort2).toHaveBeenCalled()
      expect(manager.getActiveStreamIds()).toHaveLength(0)
    })
  })

  describe("getActiveStreamIds", () => {
    it("should return array of active stream IDs", () => {
      manager.startStream("stream-1")
      manager.startStream("stream-2")

      const ids = manager.getActiveStreamIds()
      expect(ids).toEqual(expect.arrayContaining(["stream-1", "stream-2"]))
    })
  })
})
