from marshmallow import Schema, fields, validate


class MenuSchema(Schema):
    id = fields.Int(dump_only=True)
    label = fields.Str(required=True, validate=validate.Length(min=2))
    slug = fields.Str(required=True, validate=validate.Length(min=2))
    target = fields.Str(required=True)
    is_dropdown = fields.Bool(load_default=False)
    parent_id = fields.Int(load_default=None, allow_none=True)
    order = fields.Int(load_default=0)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    children = fields.List(fields.Nested(lambda: MenuSchema(exclude=("children",))))
