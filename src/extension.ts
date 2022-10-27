// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ffi from 'ffi-napi';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "toggle-ime-in-ChordMode" is now active!');


	const imm32 = ffi.Library('imm32', {
		'ImmGetContext': ['uint32', ['uint64']], // HIMC, HWND
		'ImmReleaseContext': ['uint32', ['uint64', 'uint32']], // BOOL, HWND, HIMC
		'ImmSetOpenStatus': ['uint32', ['uint32', 'uint32']], //
		'ImmGetOpenStatus': ['uint32', ['uint32']], // BOOL HIMC
		'ImmGetDefaultIMEWnd': ['uint64', ['uint64']],
	});
	const user32 = ffi.Library('user32', {
		'GetFocus': ['uint64', []],
		"GetForegroundWindow":["uint64",[]],
		//'FindWindowExA':['uint64', ['uint64', 'uint64', 'string', 'string']],
		'FindWindowExA':['uint64', ['uint64', 'uint64', 'string', 'uint64']],
		'SendMessageA':['uint64', ['uint64', 'uint64', 'uint64', 'uint64']],
	});
	let needRecoverImeState: boolean | undefined = undefined;

	function switchIme(enable:number){
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
			}
		} else {
			if (needRecoverImeState) {
				let hwndIme = imm32.ImmGetDefaultIMEWnd(hwnd);
				user32.SendMessageA(hwndIme, WM_IME_CONTROL, IMC_SETOPENSTATUS, 1);
				needRecoverImeState = false;
			}
		}
	}


	function switchIme_notwork(enable:number){
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

	let disposable = vscode.commands.registerCommand('keybindingChordMode', (enable:number) => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let message = `toggle-ime-in-ChordMode.keybindingChordMode:${enable}`;
		vscode.window.showInformationMessage(message);
		switchIme(enable);
	});
	
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
