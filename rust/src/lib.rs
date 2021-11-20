use candid::{check_prog, IDLProg, TypeEnv};
use wasm_bindgen::prelude::*;
#[wasm_bindgen]
pub fn did_to_js(prog: String) -> Option<String> {
  let ast = prog.parse::<IDLProg>().ok()?;
  let mut env = TypeEnv::new();
  let actor = check_prog(&mut env, &ast).ok()?;
  Some(candid::bindings::javascript::compile(&env, &actor))
}