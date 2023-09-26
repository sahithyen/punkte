#[derive(Clone)]
pub(crate) struct Position(pub(crate) f32, pub(crate) f32);

impl Position {
    pub(crate) fn scaled_position_to(&self, to: &Position, factor: f32) -> Position {
        Self(
            self.0 + (to.0 - self.0) * factor,
            self.1 + (to.1 - self.1) * factor,
        )
    }

    pub(crate) fn add_position(&mut self, other: Position) {
        self.0 += other.0;
        self.1 += other.1;
    }
}
