import cds from '@sap/cds';
import { Sessions, Session } from "#cds-models/archforum/cap";

// Mock the cds module
jest.mock('@sap/cds', () => ({
  service: { impl: jest.fn() },
  connect: { to: jest.fn() },
  transaction: jest.fn(),
}));

// Mock the Google Translate module
jest.mock('@google-cloud/translate', () => ({
  v2: { Translate: jest.fn(() => ({ translate: jest.fn() })) },
}));

describe('Session Service', () => {
  let sessionService: any;
  let mockMessaging: { on: jest.Mock };

  beforeAll(async () => {
    sessionService = await import('../session-service.ts');
    mockMessaging = {
      on: jest.fn(),
    };
    (cds.connect.to as jest.Mock).mockResolvedValue(mockMessaging);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle session creation event', async () => {
    const mockMsg = {
      data: {
        Uuid: 'test-uuid',
        title: 'Test Title',
        description: 'Test Description',
        Date: new Date(),
      },
    };

    const mockTx = {
      run: jest.fn().mockResolvedValue([{ ID: 'test-id' }]),
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    (cds.transaction as jest.Mock).mockReturnValue(mockTx);

    const createHandler = mockMessaging.on.mock.calls.find(call => call[0] === 'ce/archforum/ZFORUMxSESSION/CREATED/v1')[1];
    await createHandler(mockMsg);

    expect(mockTx.run).toHaveBeenCalledTimes(3); // Main insert + 2 translation inserts
    expect(mockTx.commit).toHaveBeenCalled();
    expect(mockTx.rollback).not.toHaveBeenCalled();
  });

  it('should handle session creation error', async () => {
    const mockMsg = {
      data: {
        Uuid: 'test-uuid',
        title: 'Test Title',
        description: 'Test Description',
        Date: new Date(),
      },
    };

    const mockTx = {
      run: jest.fn().mockRejectedValue(new Error('Test error')),
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    (cds.transaction as jest.Mock).mockReturnValue(mockTx);

    const createHandler = mockMessaging.on.mock.calls.find(call => call[0] === 'ce/archforum/ZFORUMxSESSION/CREATED/v1')[1];
    await expect(createHandler(mockMsg)).rejects.toThrow('Test error');

    expect(mockTx.rollback).toHaveBeenCalled();
    expect(mockTx.commit).not.toHaveBeenCalled();
  });
});
