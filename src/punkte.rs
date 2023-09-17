use js_sys::Float32Array;
use rand::{rngs::SmallRng, Rng, SeedableRng};
use wasm_bindgen::prelude::*;

use crate::allocator::PunktAllocator;

#[wasm_bindgen]
pub struct Punkte {
    last_time: Option<f64>,
    punkt_allocator: PunktAllocator,
    change_timer: f64,
    rng: SmallRng,
}

#[wasm_bindgen]
impl Punkte {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Punkte {
        // https://github.com/rustwasm/console_error_panic_hook#readme
        console_error_panic_hook::set_once();

        Self {
            last_time: None,
            punkt_allocator: PunktAllocator::new(10),
            change_timer: 1000.0,
            rng: SmallRng::from_entropy(),
        }
    }

    pub fn get_float32_array(&self) -> Float32Array {
        self.punkt_allocator.get_f32_array()
    }

    pub fn update(&mut self, time: f64) {
        // Calculate the delta of time from the last frame
        let last_time = self.last_time.unwrap_or(time);
        self.last_time = Some(time);
        let delta = time - last_time;

        // Update all points
        self.punkt_allocator.update(delta);

        self.change_timer += delta;
        if self.change_timer >= 900.0 {
            self.change_timer = 0.0;

            let punkte = self.punkt_allocator.get_punkte_mut();
            for punkt in punkte.iter_mut() {
                let to = crate::position::Position(
                    self.rng.gen_range(10.0..490.0),
                    self.rng.gen_range(10.0..490.0),
                );
                punkt.travel(to, 1000.0);
            }
        }
    }
}
