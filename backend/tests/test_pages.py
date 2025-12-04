def test_pages_crud_and_slug_immutable(client, auth_header):
    create_payload = {
        "title_translations": {"pt": "Quem Somos ABRAMS", "en": "About us"},
        "content_translations": {"pt": "<p>Conteudo</p>", "en": "<p>Content</p>"},
        "is_published": True,
    }

    # Create
    resp = client.post("/api/v1/pages", json=create_payload, headers=auth_header)
    assert resp.status_code == 201
    slug = resp.json["slug"]
    assert slug.startswith("quem-somos")

    # List
    resp_list = client.get("/api/v1/pages")
    assert resp_list.status_code == 200
    assert any(item["slug"] == slug for item in resp_list.json["items"])

    # Get by slug
    resp_slug = client.get(f"/api/v1/pages/slug/{slug}")
    assert resp_slug.status_code == 200
    assert resp_slug.json["slug"] == slug

    # Update title should not change slug
    resp_update = client.put(
        f"/api/v1/pages/{resp.json['id']}",
        json={"title_translations": {"pt": "Titulo Editado"}},
        headers=auth_header,
    )
    assert resp_update.status_code == 200
    assert resp_update.json["slug"] == slug
