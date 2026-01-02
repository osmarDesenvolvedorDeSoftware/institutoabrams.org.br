from marshmallow import Schema, fields, validate


class CommentSchema(Schema):
    id = fields.Int(dump_only=True)
    page_id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(load_default=None, allow_none=True)
    content = fields.Str(required=True, validate=validate.Length(min=2, max=1000))
    is_approved = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class CommentCreateSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(load_default=None, allow_none=True)
    content = fields.Str(required=True, validate=validate.Length(min=2, max=1000))
