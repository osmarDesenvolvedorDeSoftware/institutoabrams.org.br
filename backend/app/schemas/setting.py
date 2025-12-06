from marshmallow import Schema, fields, validate


class SettingSchema(Schema):
    id = fields.Int(dump_only=True)
    key = fields.Str(required=True, validate=validate.Length(min=2))
    value = fields.Dict(load_default={}, allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
