import * as vscode from 'vscode';
import * as ffi from 'ffi-napi';


export module impl_win{
	export function test(): string{
		return 'hello';
	}
}
export function test2(){
    return 'hello';
}

export let fun : () => void;
export let switchIme : (enable:number) => void;
export let switchIme_notwork : (enable:number) => void;
export let switchImeTo : (enable:number) => void;
export let toggleIme : () => boolean;
export let setImeHook : () => void;

const u64 = 'uint64';
const u32 = 'uint32';
let callbackG = ffi.Callback(u64, [u32, u64, u64], (code, wParam, lParam) => {
	//let wp32 = new Uint32Array(wParam.buffer);
	//let lp32 = new Uint32Array(lParam.buffer);
	console.log('code,wp,lp', code, wParam, lParam);
	let wp = 0;
	//return callback_main(code.ffi_type?.readUInt64BE() as number, wParam, lParam);
	return 0;
});

function callbackG2(code:number, wParam:number, lParam:number){
	console.log('code,wp,lp', code, wParam, lParam);
	let wp = 0;
	//return callback_main(code.ffi_type?.readUInt64BE() as number, wParam, lParam);
	return 0;
}

export function activate(){
    fun = () => {

    };

    const imm32 = ffi.Library('imm32', {
		'ImmGetContext': ['uint32', ['uint64']], // HIMC, HWND
		'ImmReleaseContext': ['uint32', ['uint64', 'uint32']], // BOOL, HWND, HIMC
		'ImmSetOpenStatus': ['uint32', ['uint32', 'uint32']], //
		'ImmGetOpenStatus': ['uint32', ['uint32']], // BOOL HIMC
		'ImmGetDefaultIMEWnd': ['uint64', ['uint64']],
	});
	const fptr_void_int = ffi.Function("void", ["int"]);
	// const u64 = ffi.types.uint64;
	const u64 = 'uint64';
	const u32 = 'uint32';
	// const fptr_CallWndProc = ffi.Function(u64, [u32, u64, u64]);
	const fptr_CallWndProc = 'pointer';
	const user32 = ffi.Library('user32', {
		'GetFocus': ['uint32', []],
		"GetForegroundWindow":["uint32",[]],
		//'FindWindowExA':['uint64', ['uint64', 'uint64', 'string', 'string']],
		'FindWindowExA':['uint64', ['uint64', 'uint64', 'string', 'uint64']],
		'SendMessageA':['uint64', ['uint64', 'uint64', 'uint64', 'uint64']],
		SetWindowsHookExA:[u64, [u64, fptr_CallWndProc, u64, u64]],
		'UnhookWindowsHookEx':['uint64', ['uint64']],
		// 'SetWinEventHook':['uint64', ['uint64', 'uint64', 'uint64', 'uint64', 'uint64', 'uint64', 'uint64']],
		SetWinEventHook: ["int", ["int", "int", "int", "pointer", "int", "int", "int"]],
		GetWindowLongPtrA:[u64, [u64, 'int32']],
		// GetWindowThreadProcessId:['uint32', [u32, 'pointer']],
		GetWindowThreadProcessId:['uint32', [u32, u64]],
	});
	const kernel32 = ffi.Library('kernel32',{
		GetLastError:[u64, []],
		GetCurrentThreadId:[u64, []],
	});
	let needRecoverImeState: boolean | undefined = undefined;

	switchIme = (enable:number) => {
		let hwnd = user32.GetForegroundWindow();

		// https://stackoverflow.com/questions/64280975/immgetcontext-returns-zero-always
		const WM_IME_CONTROL    = 0x0283;
		const IMC_GETOPENSTATUS = 0x0005;
		const IMC_SETOPENSTATUS = 0x0006;
		
		if (enable === 0) {
			let hwndIme = imm32.ImmGetDefaultIMEWnd(hwnd);
			needRecoverImeState = user32.SendMessageA(hwndIme, WM_IME_CONTROL, IMC_GETOPENSTATUS, 0) ? true : false;
			if (needRecoverImeState) {
				user32.SendMessageA(hwndIme, WM_IME_CONTROL, IMC_SETOPENSTATUS, 0);
				vscode.window.showInformationMessage('toggle:0');
			}
		} else {
			if (needRecoverImeState) {
				let hwndIme = imm32.ImmGetDefaultIMEWnd(hwnd);
				user32.SendMessageA(hwndIme, WM_IME_CONTROL, IMC_SETOPENSTATUS, 1);
				needRecoverImeState = false;
				vscode.window.showInformationMessage('toggle:1');
			}
		}
	}
	switchImeTo = (enable:number) => {
		let hwnd = user32.GetForegroundWindow();

		// https://stackoverflow.com/questions/64280975/immgetcontext-returns-zero-always
		const WM_IME_CONTROL    = 0x0283;
		const IMC_GETOPENSTATUS = 0x0005;
		const IMC_SETOPENSTATUS = 0x0006;
		
		let hwndIme = imm32.ImmGetDefaultIMEWnd(hwnd);
		if (enable === 0) {
			user32.SendMessageA(hwndIme, WM_IME_CONTROL, IMC_SETOPENSTATUS, 0);
			console.log('toggle:0');
		} else {
			user32.SendMessageA(hwndIme, WM_IME_CONTROL, IMC_SETOPENSTATUS, 1);
			console.log('toggle:1');
		}
	}

	switchIme_notwork = (enable:number) => {
		// const hwnd = user32.GetFocus();
		let hwnd = user32.GetForegroundWindow();
		// const child_hwnd = user32.FindWindowExA(hwnd, 0, 'Chrome_RenderWidgetHostHWND', 0);
		// vscode.window.showInformationMessage(`hwnd:0x${hwnd.toString(16)}, 0x${child_hwnd.toString(16)}`);

		if (enable === 0) {
			const himc = imm32.ImmGetContext(hwnd);
			needRecoverImeState = imm32.ImmGetOpenStatus(himc) !== 0;
			if (needRecoverImeState) {
				imm32.ImmSetOpenStatus(himc, 0);
			}
			imm32.ImmReleaseContext(hwnd, himc);
		} else {
			if (needRecoverImeState) {
				const himc = imm32.ImmGetContext(hwnd);
				imm32.ImmSetOpenStatus(himc, 1);
				imm32.ImmReleaseContext(hwnd, himc);
				needRecoverImeState = false;
			}
		}
	}

    toggleIme = () => {
        let hwnd = user32.GetForegroundWindow();

		// https://stackoverflow.com/questions/64280975/immgetcontext-returns-zero-always
		const WM_IME_CONTROL    = 0x0283;
		const IMC_GETOPENSTATUS = 0x0005;
		const IMC_SETOPENSTATUS = 0x0006;		
        let hwndIme = imm32.ImmGetDefaultIMEWnd(hwnd);
        let imeon = user32.SendMessageA(hwndIme, WM_IME_CONTROL, IMC_GETOPENSTATUS, 0) ? true : false;
        if(imeon){
			user32.SendMessageA(hwndIme, WM_IME_CONTROL, IMC_SETOPENSTATUS, 0);
			console.log('imeon:', 0, hwnd, hwndIme);
			return false;
        }else{
			user32.SendMessageA(hwndIme, WM_IME_CONTROL, IMC_SETOPENSTATUS, 1);
			console.log('imeon:', 1, hwnd, hwndIme);
			return true;
        }
    }

    function getImeState(hwnd:number){
		let himc = imm32.ImmGetContext(hwnd);
		let isIme = imm32.ImmGetOpenStatus(himc);
		imm32.ImmReleaseContext(hwnd, himc);
		return isIme;
	}
	function getHINSTANCE(hwnd:number){
		//const GWLP_HINSTANCE = 0xfffffffa; // -6, (0xffff ^ 6) + 1
		//const GWLP_HINSTANCE = 0xfffffffffffffffa; // -6, (0xffff ^ 6) + 1
		const GWLP_HINSTANCE = -6; // -6, (0xffff ^ 6) + 1
		let hinst = user32.GetWindowLongPtrA(hwnd, GWLP_HINSTANCE);
		console.log('gethinst', hinst, kernel32.GetLastError());
		return hinst;
	}

	function callback_main(code:number, wp:number, lp:number){
		const IMN_SETOPENSTATUS = 0x0008;
		if (wp === IMN_SETOPENSTATUS) {
			console.log('change IME');
			/*
			let hwnd = this._win.getNativeWindowHandle();
			//let xhwnd = Uint32Array.from(hwnd);
			let xhwnd = new Uint32Array(hwnd.buffer);
			let hwnd = xhwnd[0];
			*/
			let hwnd = user32.GetFocus();
			let isIme = getImeState(hwnd);
			console.log('IME to ', isIme);
			//this._win.webContents.send('vscode:IME', isIme === 1);
			//my_ime_on = isIme === 1;
			//set_my_ime_on(isIme === 1);
			switchIme(isIme === 1 ? 1 : 0);
			// call event trigger
		}
		return 0;
	}

	setImeHook = () => {
		const WM_IME_NOTIFY = 0x0282;
		const IMN_SETOPENSTATUS = 0x0008;
		const WH_CALLWNDPROC = 4;
		const WH_CALLWNDPROCRET = 12;
		const hwnd = user32.GetForegroundWindow();
		const winThrId = user32.GetWindowThreadProcessId(hwnd, 0);
		console.log('winthr', winThrId);
		// const hwnd = user32.GetFocus();
		const hinst = getHINSTANCE(hwnd);
		const pid = process.pid;

		let callback = ffi.Callback(u64, [u32, u64, u64], (code, wParam, lParam) => {
			//let wp32 = new Uint32Array(wParam.buffer);
			//let lp32 = new Uint32Array(lParam.buffer);
			console.log('code,wp,lp', code, wParam, lParam);
			let wp = 0;
			//return callback_main(code.ffi_type?.readUInt64BE() as number, wParam, lParam);
			return 0;
		});
		let threadId0 = kernel32.GetCurrentThreadId();
		let threadId = winThrId;
		// let threadId = threadId0;
		console.log('first', kernel32.GetLastError(), threadId, threadId0, hinst);

		//let hhook = user32.SetWindowsHookExA(WH_CALLWNDPROC, callback, hinst, threadId);
		let hhook = user32.SetWindowsHookExA(WH_CALLWNDPROC, callbackG, hinst, threadId);
		console.log('second', kernel32.GetLastError());
		console.log('hook', hhook);
		//let heventhook = user32.SetWinEventHook(WM_IME_NOTIFY, WM_IME_NOTIFY, 0, callback, 0, 0, 0);

		
		if(0)
		{
			const pfnWinEventProc = ffi.Callback("void", ["pointer", "int", "pointer", "long", "long", "int", "int"],
				function (hWinEventHook, event, hwnd, idObject, idChild, idEventThread, dwmsEventTime) {
					/*
					const windowTitleLength = user32.GetWindowTextLengthW(hwnd)
					const bufferSize = windowTitleLength * 2 + 4
					const titleBuffer = Buffer.alloc(bufferSize)
					user32.GetWindowTextW(hwnd, titleBuffer, bufferSize)
					const titleText = ref.reinterpretUntilZeros(titleBuffer, wchar.size)
					const finallyWindowTitle = wchar.toString(titleText)
					console.log(finallyWindowTitle)
					*/
					console.log('hello');
				}
			)
			const EVENT_SYSTEM_FOREGROUND = 3
			const WINEVENT_OUTOFCONTEXT = 0
			const WINEVENT_SKPIOWNPROCESS = 2
			let xxx = user32.SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND, 0, pfnWinEventProc,
			0, 0, WINEVENT_OUTOFCONTEXT | WINEVENT_SKPIOWNPROCESS)
			console.log('SetWinEventHook', xxx, kernel32.GetLastError());
		}
	}
}

