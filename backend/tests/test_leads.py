def test_leads_public_create(client):
    resp = client.post(
        "/api/v1/leads",
        json={"name": "João", "email": "joao@test.com", "message": "Oi", "source": "test"},
    )
    assert resp.status_code == 201
    data = resp.json
    assert data["email"] == "joao@test.com"
