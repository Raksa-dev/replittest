
import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertPartySchema } from '@shared/schema';

export class PartyController {
  async createParty(req: Request, res: Response) {
    try {
      const partyData = insertPartySchema.parse(req.body);
      const party = await storage.createParty(partyData);
      res.status(201).json(party);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getPartyById(req: Request, res: Response) {
    try {
      const partyId = parseInt(req.params.id);
      const party = await storage.getParty(partyId);
      
      if (!party) {
        return res.status(404).json({ message: "Party not found" });
      }
      
      res.json(party);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateParty(req: Request, res: Response) {
    try {
      const partyId = parseInt(req.params.id);
      const partyData = insertPartySchema.partial().parse(req.body);
      const party = await storage.updateParty(partyId, partyData);
      res.json(party);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}
