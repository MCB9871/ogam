"""Petit wrapper autour de l'API REST Payload.

Le bot ne touche jamais la base SQLite directement — Payload reste la seule
source de vérité (§2 CONTEXTE_TMA_v2.md). Authentification via clé API sur un
compte Admins dédié au bot (voir README, section "Compte bot dans Payload").
"""

import httpx

from config import PAYLOAD_API_KEY, PAYLOAD_URL

_HEADERS = {
    "Authorization": f"admins API-Key {PAYLOAD_API_KEY}",
    "Content-Type": "application/json",
}


async def get_document(collection: str, doc_id: str, depth: int = 1) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{PAYLOAD_URL}/api/{collection}/{doc_id}", headers=_HEADERS, params={"depth": depth}
        )
        resp.raise_for_status()
        return resp.json()


async def create_document(collection: str, data: dict) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{PAYLOAD_URL}/api/{collection}", headers=_HEADERS, json=data)
        resp.raise_for_status()
        return resp.json()


async def update_document(collection: str, doc_id: str, data: dict) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.patch(
            f"{PAYLOAD_URL}/api/{collection}/{doc_id}", headers=_HEADERS, json=data
        )
        resp.raise_for_status()
        return resp.json()


async def find_documents(collection: str, where: dict) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{PAYLOAD_URL}/api/{collection}",
            headers=_HEADERS,
            params={"where": _flatten_where(where)},
        )
        resp.raise_for_status()
        return resp.json()


def _flatten_where(where: dict, prefix: str = "where") -> dict:
    """Convertit un dict Python simple en query params façon Payload
    (where[field][equals]=value). Ne gère que le cas simple 'égalité',
    suffisant pour les besoins actuels du bot."""
    params = {}
    for field, condition in where.items():
        for op, value in condition.items():
            params[f"{prefix}[{field}][{op}]"] = value
    return params
