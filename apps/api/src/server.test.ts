import { describe, expect, it } from 'vitest';
import { MAX_FILE_SIZE, MAX_IMAGE_SIDE } from '@remove-bg/shared';
describe('shared image limits', () => { it('uses safe v1 limits', () => { expect(MAX_FILE_SIZE).toBe(15 * 1024 * 1024); expect(MAX_IMAGE_SIDE).toBe(6000); }); });
