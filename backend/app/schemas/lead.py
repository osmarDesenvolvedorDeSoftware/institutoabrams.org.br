from marshmallow import Schema, fields, validate


class LeadSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=2))
    email = fields.Email(required=True)
    phone = fields.Str(load_default=None, allow_none=True)
    interest = fields.Str(load_default=None, allow_none=True)
    opportunity_id = fields.Int(load_default=None, allow_none=True)
    message = fields.Str(load_default=None, allow_none=True)
    source = fields.Str(load_default=None, allow_none=True)
    created_at = fields.DateTime(dump_only=True)
