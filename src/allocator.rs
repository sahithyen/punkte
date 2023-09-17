use std::convert::TryInto;

use js_sys::{Float32Array, WebAssembly};
use wasm_bindgen::prelude::*;

use crate::{position::Position, punkt::Punkt};

// pub(crate) const NUMBER_OF_POINTS: usize = 5;
// pub(crate) static mut POINTS_BUFFER: [f32; NUMBER_OF_POINTS * 2] = [0.0; NUMBER_OF_POINTS * 2];

// #[wasm_bindgen]
// pub fn get_memory() -> JsValue {
//     wasm_bindgen::memory()
// }

// #[wasm_bindgen]
// pub fn get_points_buffer_pointer() -> *const f32 {
//     unsafe { POINTS_BUFFER.as_ptr() }
// }

// #[wasm_bindgen]
// pub fn get_points_count() -> usize {
//     NUMBER_OF_POINTS
// }

// pub(crate) fn get_buffer_point(index: usize) -> (f32, f32) {
//     let o = index * 2;
//     (unsafe { POINTS_BUFFER[o] }, unsafe { POINTS_BUFFER[o + 1] })
// }

// pub(crate) fn set_buffer_point(index: usize, value: (f32, f32)) {
//     let o = index * 2;
//     unsafe {
//         POINTS_BUFFER[o] = value.0;
//         POINTS_BUFFER[o + 1] = value.1;
//     }
// }

pub(crate) struct PunktAllocator {
    buffer: Vec<f32>,
    punkte: Vec<Punkt>,
}

impl PunktAllocator {
    pub(crate) fn new(count: usize) -> Self {
        let mut punkte = Vec::with_capacity(count);

        for _ in 0..count {
            punkte.push(Punkt::new(Position(10.0, 10.0)));
        }

        Self {
            buffer: vec![0.0; count * 2],
            punkte,
        }
    }

    pub(crate) fn get_f32_array(&self) -> Float32Array {
        let buffer = wasm_bindgen::memory()
            .dyn_into::<WebAssembly::Memory>()
            .expect("Could not cast wasm_bindgen::memory() to WebAssembly::Memory")
            .buffer();
        let ptr = self.buffer.as_ptr() as u32;
        let len = self.buffer.len() as u32;

        Float32Array::new_with_byte_offset_and_length(&buffer, ptr, len)
    }

    pub(crate) fn update(&mut self, delta: f64) {
        self.punkte
            .iter_mut()
            .zip(self.buffer.chunks_exact_mut(2))
            .for_each(|(punkt, position)| {
                punkt.update_position(delta, position.try_into().unwrap())
            })
    }

    pub(crate) fn get_punkte_mut(&mut self) -> &mut Vec<Punkt> {
        &mut self.punkte
    }
}
