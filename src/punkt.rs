use crate::position::Position;
use either::Either::{self, Left, Right};

pub struct Punkt {
    position: Either<PositionTravel, Position>,
}

impl Punkt {
    pub(crate) fn new(initial_position: Position) -> Self {
        Self {
            position: Right(initial_position),
        }
    }

    pub(crate) fn update_position(&mut self, delta: f64, position: &mut [f32; 2]) {
        let current_position = match self.position.as_mut() {
            Left(travel) => {
                travel.update_clock(delta);
                travel.get_position()
            }
            Right(position) => position.clone(),
        };

        if let Some(position) = self
            .position
            .as_ref()
            .left()
            .and_then(|travel| travel.finished())
        {
            self.position = Right(position)
        }

        (*position) = [current_position.0, current_position.1]
    }

    pub(crate) fn travel(&mut self, to: Position, duration: f64) {
        let from = match self.position.as_ref() {
            Left(travel) => travel.get_position(),
            Right(position) => position.clone(),
        };

        self.position = Left(PositionTravel::new(from, to, duration));
    }
}

struct PositionTravel {
    duration: f64,
    clock: f64,
    from: Position,
    to: Position,
}

impl PositionTravel {
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
