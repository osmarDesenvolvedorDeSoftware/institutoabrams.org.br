def test_pages_crud_and_slug_immutable(client, auth_header):
    create_payload = {
        "page": {
            "title_translations": {"pt": "Quem Somos ABRAMS", "en": "About us"},
            "content_translations": {"pt": "<p>Conteudo</p>", "en": "<p>Content</p>"},
            "is_published": True,
        },
        "create_menu": False,
    }

    # Create
    resp = client.post("/api/v1/pages/with-menu", json=create_payload, headers=auth_header)
    assert resp.status_code == 201
    slug = resp.json["page"]["slug"]
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
        f"/api/v1/pages/{resp_slug.json['id']}",
        json={"title_translations": {"pt": "Titulo Editado"}},
        headers=auth_header,
    )
    assert resp_update.status_code == 200
    assert resp_update.json["slug"] == slug


def test_page_content_is_normalized_on_save(client, auth_header):
    create_payload = {
        "title_translations": {"pt": "Pagina com espacos"},
        "content_translations": {
            "pt": "<p>Primeiro bloco</p><p><br></p><p>&nbsp;</p><p>Segundo bloco</p>"
        },
        "is_published": True,
    }

    resp = client.post("/api/v1/pages", json=create_payload, headers=auth_header)
    assert resp.status_code == 201
    assert resp.json["content_translations"]["pt"] == "<p>Primeiro bloco</p><p>Segundo bloco</p>"

    page_id = resp.json["id"]
    update_resp = client.put(
        f"/api/v1/pages/{page_id}",
        json={
            "content_translations": {
                "pt": "<p>Atualizado</p><p><br></p><p><br></p><p>Final</p>"
            }
        },
        headers=auth_header,
    )
    assert update_resp.status_code == 200
    assert update_resp.json["content_translations"]["pt"] == "<p>Atualizado</p><p>Final</p>"
