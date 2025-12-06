from marshmallow import Schema, fields, validate


class BannerSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=2))
    subtitle = fields.Str(load_default=None, allow_none=True)
    image_url = fields.Str(required=True)
    link_url = fields.Str(load_default=None, allow_none=True)
    order = fields.Int(load_default=0)
    is_active = fields.Bool(load_default=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
