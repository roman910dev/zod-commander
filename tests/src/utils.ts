import { expect, jest } from '@jest/globals'

export function expectExit(fun: () => void, code?: number) {
	const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
		throw new Error(`process.exit`)
	})
	expect(fun).toThrow('process.exit')
	if (code) expect(mockExit).toHaveBeenCalledWith(code)
	mockExit.mockRestore()
}
