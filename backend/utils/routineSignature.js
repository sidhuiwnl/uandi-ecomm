const crypto = require('crypto');

function generateRoutineSignature(items) {
    const normalized = items
        .map(i => ({
            product_id: i.product_id,
            variant_id: i.variant_id ?? 'null',
            position: i.position
        }))
        .sort((a, b) => a.position - b.position)
        .map(i => `${i.product_id}:${i.variant_id}:${i.position}`)
        .join('|');

    return crypto
        .createHash('sha256')
        .update(normalized)
        .digest('hex');
}

export default generateRoutineSignature;
