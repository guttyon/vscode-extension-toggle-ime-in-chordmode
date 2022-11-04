import * as vscode from 'vscode';
import * as ffi from 'ffi-napi';
import { ChildProcess, exec } from 'child_process';

export let switchIme: (enable:number) => void;
export let toggleIme: () => void;

export function activate(){
    function cmdexec(cmd:string){
        let cpr = exec(cmd, (err, stdout, stderr) => {
            console.log('executed:', cmd);
            if(err){
                console.log(err);
            }
            if(stderr){
                console.log(stderr);
            }
            if(stdout){
                console.log(stdout);
            }
        });
        return cpr;
    }

    switchIme = (enable: number) => {
        if(enable === 0){
            let cpr = cmdexec('fcitx-remote -c');
        }else{
            let cpr = cmdexec('fcitx-remote -o');
        }
    }
    toggleIme = () => { 
        let enable = 0;
        if(enable === 0){
            let cpr = cmdexec('fcitx-remote -c');
        }else{
            let cpr = cmdexec('fcitx-remote -o');
        }
    }
}
