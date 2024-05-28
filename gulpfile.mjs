import { series, parallel, watch } from "gulp";
import { spawn } from "node:child_process";

function npmInstall(cb) {
  spawn("npm", ["install"], { stdio: "inherit" })
    .on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      cb();
    });
}

function buildCore(cb) {
  spawn("wasm-pack", ["build", "--out-dir", "core-pkg", "--out-name", "punkte-core", "./core"], { stdio: "inherit" })
    .on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      cb();
    });
}

function buildPunkte(cb) {
  spawn("npm", ["run", "build"], { stdio: "inherit", cwd: "./punkte" })
    .on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      cb();
    });
}

const buildAll = series(buildCore, npmInstall, buildPunkte);

function watchAll (cb) {
  watch(["core/src/**/*.rs", "punkte/src/**/*.ts"], buildAll)
  cb()
}

function watchDemo(cb) {
  spawn("npm", ["run", "start"], { stdio: "inherit", cwd: "./demo" })
    .on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      cb();
    });
}

export function clean(cb) {
  spawn("rm", ["-rf", "core/core-pkg", "core/target", "core/Cargo.lock", "punkte/dist", "node_modules"], { stdio: "inherit" })
    .on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      cb();
    });
}

const defaultTask = series(buildAll, parallel(watchAll, watchDemo));

export default defaultTask
