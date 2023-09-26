use std::{convert::TryFrom, error::Error};

use gloo::utils::format::JsValueSerdeExt;
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Copy, Clone, Deserialize)]
pub struct Config {
    pub count: usize,
    pub tremble: TrembleConfig,
    pub punkt: PunktConfig,
}

impl TryFrom<JsValue> for Config {
    type Error = Box<dyn Error>;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        value.into_serde().map_err(Box::from)
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone, Deserialize)]
pub struct PunktConfig {
    pub min_radius: f32,
    pub max_radius: f32,
    pub min_opacity: f32,
    pub max_opacity: f32,
}

#[wasm_bindgen]
#[derive(Copy, Clone, Deserialize)]
pub struct TrembleConfig {
    pub offset: f32,
    pub min_time: f64,
    pub max_time: f64,
}
