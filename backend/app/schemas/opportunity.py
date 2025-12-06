from marshmallow import Schema, fields, validate


class OpportunitySchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=3))
    description = fields.Str(load_default=None, allow_none=True)
    institution = fields.Str(load_default=None, allow_none=True)
    category = fields.Str(load_default=None, allow_none=True)
    status = fields.Str(
        load_default="draft",
        validate=validate.OneOf(["draft", "open", "closed", "archived"]),
    )
    deadline = fields.Date(allow_none=True)
    official_link = fields.Str(load_default=None, allow_none=True)
    image_url = fields.Str(load_default=None, allow_none=True)
    video_url = fields.Str(load_default=None, allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
