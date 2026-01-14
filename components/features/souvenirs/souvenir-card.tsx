"use client";

import { Souvenir } from "@/lib/types/souvenir";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Gift,
  Package,
  Star,
  Heart,
  Crown,
  Sparkles,
  Trophy,
  Medal,
  Gem,
  Hexagon,
  Award,
  CircleDot,
  Boxes,
  Coins,
  Flower2,
} from "lucide-react";
import Image from "next/image";

const ICONS: Record<string, any> = {
  Gift,
  Package,
  Star,
  Heart,
  Crown,
  Sparkles,
  Trophy,
  Medal,
  Gem,
  Hexagon,
  Award,
  CircleDot,
  Boxes,
  Coins,
  Flower2,
};

interface SouvenirCardProps {
  souvenir: Souvenir;
  onEdit: (souvenir: Souvenir) => void;
  onDelete: (souvenir: Souvenir) => void;
}

export function SouvenirCard({
  souvenir,
  onEdit,
  onDelete,
}: SouvenirCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-[2rem] border-none shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-xl transition-all duration-300 bg-white">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-2xl transition-colors duration-300 ${
                souvenir.color || "bg-blue-50 text-blue-600"
              }`}
            >
              {(() => {
                const IconComp = ICONS[souvenir.icon] || Gift;
                return <IconComp className="w-6 h-6" />;
              })()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {souvenir.name}
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {souvenir.stock > 0 ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                {souvenir.stock} left
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-medium line-clamp-2">
            {souvenir.description || "No description"}
          </p>
          <p className="text-xs font-bold capitalize text-gray-500">
            Categories :
          </p>
          <div className="flex flex-wrap gap-1">
            {souvenir.category_restrictions &&
            souvenir.category_restrictions.length > 0 ? (
              souvenir.category_restrictions.map((cat) => (
                <Badge
                  key={cat}
                  variant="outline"
                  className="text-[10px] rounded-full"
                >
                  {cat}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-[10px] rounded-full">
                ALL
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-0 pt-0">
        <div className="flex w-full items-center gap-2 border-t border-gray-50 pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => onEdit(souvenir)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(souvenir)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
