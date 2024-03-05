use std::{convert::TryInto, rc::Rc};

use js_sys::{Float32Array, WebAssembly};
use rand::{rngs::SmallRng, Rng};
use wasm_bindgen::prelude::*;

use crate::{config::Config, position::Position, punkt::Punkt};

pub(crate) struct PunktAllocator {
    positions_buffer: Vec<f32>,
    properties_buffer: Vec<f32>,
    punkte: Vec<Punkt>,
}

impl PunktAllocator {
    pub(crate) fn new(config: Rc<Config>, rng: &mut SmallRng) -> Self {
        let count = config.count;

        let mut punkte = Vec::with_capacity(count);
        for _ in 0..count {
            let x = rng.gen_range(28.0..472.0);
            let y = rng.gen_range(28.0..472.0);
            let position = Position(x, y);
            punkte.push(Punkt::new(config.clone(), position, rng));
        }

        // Set flags
        let mut properties_buffer = vec![0.0; count * 2];
        punkte
            .iter_mut()
            .zip(properties_buffer.chunks_exact_mut(2))
            .for_each(|(punkt, properties)| punkt.set_properties(properties.try_into().unwrap()));

        Self {
            positions_buffer: vec![0.0; count * 2],
            properties_buffer,
            punkte,
        }
    }

    pub(crate) fn get_positions_buffer(&self) -> Float32Array {
        let buffer = wasm_bindgen::memory()
            .dyn_into::<WebAssembly::Memory>()
            .expect("Could not cast wasm_bindgen::memory() to WebAssembly::Memory")
            .buffer();
        let ptr = self.positions_buffer.as_ptr() as u32;
        let len = self.positions_buffer.len() as u32;

        Float32Array::new_with_byte_offset_and_length(&buffer, ptr, len)
    }

    pub(crate) fn get_properties_buffer(&self) -> Float32Array {
        let buffer = wasm_bindgen::memory()
            .dyn_into::<WebAssembly::Memory>()
            .expect("Could not cast wasm_bindgen::memory() to WebAssembly::Memory")
            .buffer();
        let ptr = self.properties_buffer.as_ptr() as u32;
        let len = self.properties_buffer.len() as u32;

        Float32Array::new_with_byte_offset_and_length(&buffer, ptr, len)
    }

    pub(crate) fn update(&mut self, delta: f64, rng: &mut SmallRng) {
        self.punkte
            .iter_mut()
            .zip(self.positions_buffer.chunks_exact_mut(2))
            .for_each(|(punkt, position)| {
                punkt.update_buffers(delta, rng, position.try_into().unwrap())
            })
    }

    pub(crate) fn get_punkte(&mut self) -> &mut Vec<Punkt> {
        self.punkte.as_mut()
    }
}
