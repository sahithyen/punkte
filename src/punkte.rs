use std::cell::RefCell;
use std::rc::Rc;

use crate::error::{PunkteError, Result};
use gloo::render::{request_animation_frame, AnimationFrame};
use wasm_bindgen::prelude::*;
use web_sys::console::log_1;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

#[wasm_bindgen]
pub struct Punkte(Rc<RefCell<PunkteData>>);

#[wasm_bindgen]
impl Punkte {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: JsValue) -> Result<Punkte> {
        // https://github.com/rustwasm/console_error_panic_hook#readme
        console_error_panic_hook::set_once();

        // Check and cast the element to canvas element
        let canvas: web_sys::HtmlCanvasElement = canvas
            .dyn_into::<web_sys::HtmlCanvasElement>()
            .map_err(|received| {
                PunkteError::cast_failed(
                    "HtmlCanvasElement",
                    "the first argument of Punkte.new",
                    received,
                )
            })?;

        // Get 2d context from canvas
        let Some(context) = canvas.get_context("2d").map_err(PunkteError::create_context_failed)? else {
            return Err(PunkteError::context_2d_not_supported());
        };
        let context = context
            .dyn_into::<CanvasRenderingContext2d>()
            .map_err(|received| {
                PunkteError::cast_failed(
                    "CanvasRenderingContext2d",
                    "from canvas.get_context(\"2d\")",
                    received.into(),
                )
            })?;

        // Initialize internal data
        let data = PunkteData::new(canvas, context);

        Ok(Punkte(Rc::new(RefCell::new(data))))
    }

    pub fn start(&self) {
        let data = self.0.clone();

        // Check if render loop is already running
        if data.borrow().animation_frame.is_some() {
            log_1(&"[Punkte.start] already running".into());
            return;
        }

        PunkteData::render_loop(data);
    }

    pub fn stop(&self) {
        let Some(_) = self.0.borrow_mut().animation_frame.take() else {
            log_1(&"[Punkte.stop] already stopped".into());
            return;
        };
    }
}

struct PunkteData {
    canvas: HtmlCanvasElement,
    context: CanvasRenderingContext2d,
    animation_frame: Option<AnimationFrame>,
    last_time: Option<f64>,
    pos: (f64, f64),
}

impl PunkteData {
    fn new(canvas: HtmlCanvasElement, context: CanvasRenderingContext2d) -> Self {
        Self {
            canvas,
            context,
            animation_frame: None,
            last_time: None,
            pos: (0.0, 50.0),
        }
    }

    fn render_loop(data: Rc<RefCell<Self>>) {
        let animation_frame = {
            let data = data.clone();
            request_animation_frame(move |time: f64| {
                data.borrow_mut().render(time);
                PunkteData::render_loop(data);
            })
        };

        data.borrow_mut().animation_frame = animation_frame.into();
    }

    fn render(&mut self, time: f64) {
        // Calculate the delta of time from the last frame
        let last_time = self.last_time.unwrap_or(time);
        self.last_time = Some(time);
        let delta = time - last_time;

        self.pos = (self.pos.0 + delta / 20.0, self.pos.1);

        self.context.clear_rect(0.0, 0.0, 500.0, 500.0);

        self.context.begin_path();
        self.context
            .arc(self.pos.0, self.pos.1, 4.0, 0.0, std::f64::consts::PI * 2.0)
            .unwrap();
        self.context.close_path();
        self.context.fill();
    }
}
