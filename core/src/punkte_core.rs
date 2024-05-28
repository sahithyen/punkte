use std::{convert::TryInto, rc::Rc};

use js_sys::Float32Array;
use rand::{rngs::SmallRng, Rng, SeedableRng};
use wasm_bindgen::prelude::*;

use crate::{allocator::PunktAllocator, config::Config, position::Position};

#[wasm_bindgen]
pub struct PunkteCore {
    last_time: Option<f64>,
    punkt_allocator: PunktAllocator,
    rng: SmallRng,
}

#[wasm_bindgen]
impl PunkteCore {
    #[wasm_bindgen(constructor)]
    pub fn new(config: JsValue) -> PunkteCore {
        // https://github.com/rustwasm/console_error_panic_hook#readme
        console_error_panic_hook::set_once();

        let config: Config = config.try_into().expect("Invalid config object");
        let config = Rc::from(config);

        let mut rng = SmallRng::from_entropy();

        Self {
            last_time: None,
            punkt_allocator: PunktAllocator::new(config, &mut rng),
            rng,
        }
    }

    pub fn get_positions_buffer(&self) -> Float32Array {
        self.punkt_allocator.get_positions_buffer()
    }

    pub fn get_properties_buffer(&self) -> Float32Array {
        self.punkt_allocator.get_properties_buffer()
    }

    pub fn update(&mut self, time: f64) {
        // Calculate the delta of time from the last frame
        let last_time = self.last_time.unwrap_or(time);
        self.last_time = Some(time);
        let delta = time - last_time;

        // Update all points
        self.punkt_allocator.update(delta, &mut self.rng);
    }

    pub fn rectangle(&mut self, x: f32, y: f32, width: f32, height: f32) {
        for punkt in self.punkt_allocator.get_punkte() {
            let x = self.rng.gen_range(x..(x + width));
            let y = self.rng.gen_range(y..(y + height));

            punkt.travel(Position(x, y), 1000.0);
        }
    }
}
