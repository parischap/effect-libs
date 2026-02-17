import * as TestUtils from "@parischap/configs/TestUtils";
import * as MChunk from '@parischap/effect-lib/MChunk'
import * as MPredicate from '@parischap/effect-lib/MPredicate'
import {pipe} from 'effect'
import * as Chunk from 'effect/Chunk'
import { describe, it } from "vitest";

describe("MChunk", () => {
  describe("hasLength", () => {
    it("Simple chunk", () => {
      TestUtils.assertTrue(pipe(Chunk.make(1, 2, 3), MChunk.hasLength(3)));
    });
  });

  describe("hasDuplicates", () => {
    it("With no duplicates", () => {
      TestUtils.assertFalse(pipe(Chunk.make(1, 2, 3), MChunk.hasDuplicates));
    });

    it("With duplicates", () => {
      TestUtils.assertTrue(pipe(Chunk.make(1, 2, 3, 2), MChunk.hasDuplicates));
    });
  });

  describe("findAll", () => {
    it("Empty chunk", () => {
      TestUtils.assertTrue(
        pipe(Chunk.empty<number>(), MChunk.findAll(MPredicate.strictEquals(3)), Chunk.isEmpty),
      );
    });
    it("Non empty chunk", () => {
      TestUtils.assertEquals(
        pipe(Chunk.make(3, 2, 5, 3, 8, 3), MChunk.findAll(MPredicate.strictEquals(3))),
        Chunk.make(0, 3, 5),
      );
    });
  });

  describe("takeBut", () => {
    it("Empty chunk", () => {
      TestUtils.assertTrue(pipe(Chunk.empty<number>(), MChunk.takeBut(2), Chunk.isEmpty));
    });
    it("Non empty chunk", () => {
      TestUtils.assertEquals(
        pipe(Chunk.make(3, 2, 5, 3, 8, 3), MChunk.takeBut(2)),
        Chunk.make(3, 2, 5, 3),
      );
    });
  });

  describe("takeRightBut", () => {
    it("Empty chunk", () => {
      TestUtils.assertTrue(pipe(Chunk.empty<number>(), MChunk.takeRightBut(2), Chunk.isEmpty));
    });
    it("Non empty chunk", () => {
      TestUtils.assertEquals(
        pipe(Chunk.make(3, 2, 5, 3, 8, 3), MChunk.takeRightBut(2)),
        Chunk.make(5, 3, 8, 3),
      );
    });
  });
});
