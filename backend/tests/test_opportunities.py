def test_opportunities_flow(client, auth_header):
    payload = {
        "title": "Bolsa Pesquisa",
        "description": "Detalhes da bolsa",
        "category": "pesquisa",
        "status": "open",
    }

    resp = client.post("/api/v1/opportunities", json=payload, headers=auth_header)
    assert resp.status_code == 201
    opp_id = resp.json["id"]

    # List
    resp_list = client.get("/api/v1/opportunities")
    assert resp_list.status_code == 200
    assert any(item["id"] == opp_id for item in resp_list.json["items"])

    # Filter by category
    resp_filter = client.get("/api/v1/opportunities", query_string={"category": "pesquisa"})
    assert resp_filter.status_code == 200
    assert any(item["id"] == opp_id for item in resp_filter.json["items"])

    # Update status
    resp_update = client.put(
        f"/api/v1/opportunities/{opp_id}",
        json={"status": "closed"},
        headers=auth_header,
    )
    assert resp_update.status_code == 200
    assert resp_update.json["status"] == "closed"
