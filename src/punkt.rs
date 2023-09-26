use std::rc::Rc;

use crate::{config::Config, position::Position};
use either::Either::{self, Left, Right};
use rand::{rngs::SmallRng, Rng};

pub struct Punkt {
    config: Rc<Config>,
    position: Either<Travel, Position>,
    tremble: Travel,
    size: f32,
    opacity: f32,
}

impl Punkt {
    pub(crate) fn new(config: Rc<Config>, initial_position: Position, rng: &mut SmallRng) -> Self {
        let (to, duration) = Punkt::new_tremble_position(&config, rng);

        let size = rng.gen_range(config.punkt.min_radius..=config.punkt.max_radius);
        let opacity = rng.gen_range(config.punkt.min_opacity..=config.punkt.max_opacity);

        Self {
            config,
            position: Right(initial_position),
            tremble: Travel::new(Position(0.0, 0.0), to, duration),
            size,
            opacity,
        }
    }

    pub(crate) fn new_tremble_position(config: &Rc<Config>, rng: &mut SmallRng) -> (Position, f64) {
        let offset = config.tremble.offset;
        let time = rng.gen_range(config.tremble.min_time..config.tremble.max_time);

        let to = Position(
            rng.gen_range(-offset..offset),
            rng.gen_range(-offset..offset),
        );

        (to, time)
    }

    pub(crate) fn set_properties(&self, flag: &mut [f32; 2]) {
        flag[0] = self.size;
        flag[1] = self.opacity;
    }

    pub(crate) fn update_buffers(
        &mut self,
        delta: f64,
        rng: &mut SmallRng,
        position: &mut [f32; 2],
    ) {
        // Update main position
        let mut current_position = match self.position.as_mut() {
            Left(travel) => {
                travel.update_clock(delta);
                travel.get_position()
            }
            Right(position) => position.clone(),
        };

        // Convert to position if reached target
        if let Some(position) = self
            .position
            .as_ref()
            .left()
            .and_then(|travel| travel.finished())
        {
            self.position = Right(position)
        }

        // Update tremble position
        self.tremble.update_clock(delta);
        let tremble_position = self.tremble.get_position();

        // Change to new tremble position if destination is reached
        if let Some(from) = self.tremble.finished() {
            let (to, duration) = Punkt::new_tremble_position(&self.config, rng);
            self.tremble = Travel::new(from, to, duration)
        }

        // Add tremble
        current_position.add_position(tremble_position);

        (*position) = [current_position.0, current_position.1]
    }

    pub(crate) fn travel(&mut self, to: Position, duration: f64) {
        let from = match self.position.as_ref() {
            Left(travel) => travel.get_position(),
            Right(position) => position.clone(),
        };

        self.position = Left(Travel::new(from, to, duration));
    }
}

struct Travel {
    duration: f64,
    clock: f64,
    from: Position,
    to: Position,
}

impl Travel {
    fn new(from: Position, to: Position, duration: f64) -> Self {
        Self {
            duration,
            clock: 0.0,
            from,
            to,
        }
    }

    fn update_clock(&mut self, delta: f64) {
        self.clock += delta;
    }

    fn get_position(&self) -> Position {
        match self.clock {
            clock if clock >= self.duration => self.to.clone(),
            clock => self
                .from
                .scaled_position_to(&self.to, (clock / self.duration) as f32),
        }
    }

    fn finished(&self) -> Option<Position> {
        if self.clock >= self.duration {
            Some(self.to.clone())
        } else {
            None
        }
    }
}
