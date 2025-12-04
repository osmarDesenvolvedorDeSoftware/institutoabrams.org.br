from marshmallow import Schema, fields, validate


class TranslationSchema(Schema):
    id = fields.Int(dump_only=True)
    key = fields.Str(required=True, validate=validate.Length(min=2))
    texts = fields.Dict(
        keys=fields.Str(validate=validate.Length(equal=2)),
        values=fields.Str(),
        required=True,
    )
    created_at = fields.DateTime(dump_only=True)
