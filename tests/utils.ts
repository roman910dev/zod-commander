import { expect, vi } from 'vitest'

export function expectExit(fun: () => void, code?: number) {
	const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
		throw new Error(`process.exit`)
	})
	expect(fun).toThrow('process.exit')
	if (code) expect(mockExit).toHaveBeenCalledWith(code)
	mockExit.mockRestore()
}
