from marshmallow import Schema, fields, validate


slug_validator = validate.Regexp(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", error="Use apenas slugs em-kebab-case.")


class PageSchema(Schema):
    id = fields.Int(dump_only=True)
    slug = fields.Str(required=True, validate=[validate.Length(min=2), slug_validator])
    title_translations = fields.Dict(
        keys=fields.Str(validate=validate.Length(equal=2)),
        values=fields.Str(),
        required=True,
    )
    content_translations = fields.Dict(
        keys=fields.Str(validate=validate.Length(equal=2)),
        values=fields.Str(allow_none=True),
        load_default={},
    )
    is_published = fields.Bool(load_default=False)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
