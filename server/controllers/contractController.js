const GeneratedContract = require('../models/Contract');
const ContractTemplate = require('../models/ContractTemplate');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// List all generated contracts
const getAllGeneratedContracts = async (req, res) => {
  try {
    const contracts = await GeneratedContract.find().populate('templateId').populate('generatedBy', 'name email');
    res.json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single generated contract by ID
const getGeneratedContract = async (req, res) => {
  try {
    const contract = await GeneratedContract.findById(req.params.id).populate('templateId').populate('generatedBy', 'name email');
    if (!contract) return res.status(404).json({ msg: 'Contract not found' });
    res.json(contract);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Generate a new contract from template and filled data
const generateContract = async (req, res) => {
  const { name, templateId, roleType, generatedBy, filledData } = req.body;
  try {
    // Fetch template and validate placeholders
    const template = await ContractTemplate.findById(templateId);
    if (!template) return res.status(400).json({ msg: 'Template not found' });
    // Fill template content
    let filledContent = template.content;
    Object.entries(filledData).forEach(([ph, val]) => {
      filledContent = filledContent.replace(new RegExp(`{{\\s*${ph}\\s*}}`, 'g'), val || `[${ph}]`);
    });
    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    // Split content into lines for PDF rendering
    const lines = filledContent.split('\n');
    let y = height - 40;
    lines.forEach(line => {
      page.drawText(line, { x: 40, y, size: fontSize, font });
      y -= fontSize + 4;
    });
    const pdfBytes = await pdfDoc.save();
    // Save PDF to disk
    const fileName = `contract_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, '../uploads/contracts');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(__dirname, '../uploads/contracts', fileName);
    fs.writeFileSync(filePath, pdfBytes);
    const generatedDocUrl = `/uploads/contracts/${fileName}`;

    if (req.body._id) {
      // Update existing contract
      const updated = await GeneratedContract.findByIdAndUpdate(
        req.body._id,
        {
          name,
          templateId,
          roleType,
          generatedBy,
          filledData,
          generatedDocUrl,
          status: 'pending',
        },
        { new: true }
      );
      res.status(200).json(updated);
    } else {
      // Create new contract
      const contract = new GeneratedContract({
        name,
        templateId,
        roleType,
        generatedBy,
        filledData,
        generatedDocUrl,
        status: 'pending',
      });
      await contract.save();
      res.status(201).json(contract);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Send contract for e-signature (stub)
const sendForSignature = async (req, res) => {
  // TODO: Integrate with DocuSign/Adobe Sign
  res.json({ msg: 'Signature request sent (stub)' });
};

// Download contract PDF
const downloadContract = async (req, res) => {
  try {
    const contract = await GeneratedContract.findById(req.params.id);
    if (!contract || !contract.generatedDocUrl) return res.status(404).json({ msg: 'Contract or PDF not found' });
    // Remove leading slash if present
    let filePath = contract.generatedDocUrl;
    if (filePath.startsWith('/')) filePath = filePath.slice(1);
    const absPath = path.resolve(__dirname, '../..', filePath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ msg: 'PDF file not found on server' });
    res.download(absPath, err => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Error downloading file');
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a generated contract
const deleteGeneratedContract = async (req, res) => {
  try {
    await GeneratedContract.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Contract deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllGeneratedContracts,
  getGeneratedContract,
  generateContract,
  sendForSignature,
  downloadContract,
  deleteGeneratedContract,
}; 