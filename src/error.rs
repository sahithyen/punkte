use wasm_bindgen::{prelude::*, JsValue};

pub type Result<T> = std::result::Result<T, PunkteError>;

#[wasm_bindgen(getter_with_clone)]
pub struct PunkteError {
    pub code: String,
    pub message: String,
    pub attachment: JsValue,
    pub source: JsValue,
}

impl PunkteError {
    pub fn cast_failed(expected: &str, from: &str, received: JsValue) -> Self {
        let attachment = CastFailedAttachment { received };

        PunkteErrorBuilder::new(
            "CastFailed",
            format!("Casting failed: Expected {expected} from {from}").as_str(),
        )
        .with_attachment(attachment.into())
        .build()
    }

    pub fn create_context_failed(source: JsValue) -> Self {
        PunkteErrorBuilder::new(
            "CreateContextFailed",
            "Creation of context for canvas failed",
        )
        .with_source(source)
        .build()
    }

    pub fn context_2d_not_supported() -> Self {
        PunkteErrorBuilder::new_from_string(
            "Context2dNotSupported",
            format!("Context 2d is not supported by canvas, but is required by Punkte"),
        )
        .build()
    }
}

struct PunkteErrorBuilder {
    code: String,
    message: String,
    attachment: Option<JsValue>,
    source: Option<JsValue>,
}

impl PunkteErrorBuilder {
    pub fn new(code: &str, message: &str) -> Self {
        Self {
            code: code.to_string(),
            message: message.to_string(),
            attachment: None,
            source: None,
        }
    }

    pub fn new_from_string(code: &str, message: String) -> Self {
        Self {
            code: code.to_string(),
            message,
            attachment: None,
            source: None,
        }
    }

    pub fn with_attachment(mut self, attachment: JsValue) -> Self {
        self.attachment = Some(attachment);
        self
    }

    pub fn with_source(mut self, source: JsValue) -> Self {
        self.source = Some(source);
        self
    }

    pub fn build(self) -> PunkteError {
        PunkteError {
            code: self.code,
            message: self.message,
            attachment: self.attachment.unwrap_or(JsValue::null()),
            source: self.source.unwrap_or(JsValue::null()),
        }
    }
}

#[wasm_bindgen(getter_with_clone)]
struct CastFailedAttachment {
    pub received: JsValue,
}
